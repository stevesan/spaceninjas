using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using System;

public class Player : MonoBehaviour {

    public interface EventHandler : IEventSystemHandler {
        void OnBoost( int boostsUsed, bool isDashing );
        void OnOutOfBoosts();
        void OnRest();
        void OnPickupCoin();
        void OnHealthChange(bool isHeal);
        void OnGracePeriodChange(bool sGracePeriod);
    }

    // Should be an interface...but Unity Editor does not support interface fields
    public abstract class Input : MonoBehaviour {
        public abstract bool IsTriggerMove( Dir2D dir );
        public abstract bool IsHoldingMove( Dir2D dir );
    }

    // scope-bound
    private Input input;
    private Main main;

    public SpawnSpec onHurt;


    public List<GameObject> inventory;

    enum MoveState {Idle, Moving};

    float speed = 8f;
    int maxBoosts = 9999;
    int health = 5;
    int maxHealth = 5;

    float gracePeriod = 0f;

    private MoveState moveState = MoveState.Idle;
    private Dir2D lastMoveDir = Dir2D.Right;
    private Dir2D bufferedBoostDir = Dir2D.Right;
    private bool isBoostBuffered = false;

    private Rigidbody2D rb;

    private int boostsUsed = 0;
    private bool isDashing = false;
    private int lastMovingFrame = -1;
    private bool boostedLastUpdate = false;

	// Use this for initialization
	void Start () {
        rb = GetComponent<Rigidbody2D>();
        onHurt.OnStart();

        var scope = GetComponentInParent<GameScope>();
        input = scope.Get<Input>();
        main = scope.Get<Main>();
	}

    void TriggerBoost(Dir2D dir) {

        bool boostAllowed = boostsUsed < maxBoosts;

        // but allow boost in the given direction if a wall is close enough
        // a "grab"
        // TODO: allow this or not?
        // Design decision. To allow this or not? If we allow it,
        // it creates a "boring optimal" way of getting around corners.
        // But without it, it feels "unfair". Meh.
        // I think it's best to leave it out. Removes complexity from the rules.
        // And, figuring out how to get around corners without this is fun.
        //if( CheckForWall(dir) ) {
            //Debug.Log("grab");
            //boostAllowed = true;
        //}

        if( boostAllowed ) {
            boostsUsed++;
            isDashing = false;

            /*
            if( moveState == MoveState.Moving && dir != lastMoveDir ) {
                // immediately change direction, so don't accumulate existing velocity
                rb.velocity = Vector2.zero;
            }
            */

            if( dir == lastMoveDir ) {
                // if same dir, allow extra boost of speed
                isDashing = true;
            }

            if( dir != lastMoveDir ) {
                rb.AddStoppingForce();
            }
            else {
                // do nothing - add to existing velocity as a double boost
            }
            rb.AddForce(dir.GetVector2() * speed * rb.mass, ForceMode2D.Impulse);
            boostedLastUpdate = true;
            lastMoveDir = dir;
            moveState = MoveState.Moving;

            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnBoost(boostsUsed, isDashing));

            isBoostBuffered = false;
        }
        else {
            // out of boosts
            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnOutOfBoosts());

            bufferedBoostDir = dir;
            isBoostBuffered = true;
        }
    }

    void UpdateGracePeriod() {
        if( gracePeriod > 0f ) {
            gracePeriod -= Time.deltaTime;
            if( gracePeriod < 0f ) {
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(false));
            }
        }
    }

    void TriggerBoostIfInputted() {
        foreach( Dir2D dir in Enum.GetValues(typeof(Dir2D)) ) {
            if( input.IsTriggerMove(dir) ) {
                TriggerBoost(dir);
            }
        }

    }

    bool CheckForWall( Dir2D dir ) {
        foreach( Collider2D col in OverlapAll(dir) ) {
            if( col.gameObject == this.gameObject ) {
                continue;
            }
            if( !col.isTrigger ) {
                Debug.Log("found wall: " + col.gameObject.name);
                return true;
            }
        }
        return false;
    }

    Collider2D[] OverlapAll( Dir2D dir ) {
        CircleCollider2D myCol = GetComponent<CircleCollider2D>();
        Vector2 c = transform.position.GetXY() + dir.GetVector2()*myCol.radius;
        return Physics2D.OverlapCircleAll( c, myCol.radius );
    }

    RaycastHit2D[] CastAll(Dir2D dir, float maxDist) {
        CircleCollider2D myCol = GetComponent<CircleCollider2D>();
        return Physics2D.CircleCastAll(
                transform.position,
                myCol.radius,
                dir.GetVector2(),
                maxDist);
    }

	void Update()
    {
        UpdateGracePeriod();

        boostedLastUpdate = false;
        if( moveState == MoveState.Idle ) {
            // execute buffered, held command.
            if( isBoostBuffered && input.IsHoldingMove(bufferedBoostDir) ) {
                TriggerBoost(bufferedBoostDir);
            }
            else {
                TriggerBoostIfInputted();
            }
        }
        else if( moveState == MoveState.Moving ) {
            TriggerBoostIfInputted();
        }

        if(GetHealth() <= 0) {
            main.OnGameOver();
        }
	}

    public void OnGetCoin(Coin coin) {
        ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnPickupCoin());
    }

    public bool OnHeal(int amt) {
        return OnHurt(-1 * amt);
    }

    public bool OnHurt(int amt) {
        if(amt == 0) {
            return false;
        }

        if( amt > 0 ) {
            // hurting
            if( amt > 0 && gracePeriod <= 0f ) {
                health -= amt;
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnHealthChange(amt < 0));

                gracePeriod = 2f;
                onHurt.Spawn(transform);
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(true));
                return true;
            }
            else {
                return false;
            }
        }
        else {
            // healing
            if( health < maxHealth ) {
                health -= amt;
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnHealthChange(amt < 0));
                return true;
            }
            else {
                return false;
            }
        }

    }

    void OnCollisionEnter2D( Collision2D col ) {
        if( moveState == MoveState.Moving ) {
            // move back slightly to not actually touch the block
            transform.position += (Vector3)col.contacts[0].normal * 0.1f;

            // apply impulse to zero out velocity
            // but, don't do this if the player hit a direction on the same frame
            // this can have the effect of canceling out the input, which feels bad
            if(!boostedLastUpdate) {
                rb.AddStoppingForce();
            }

            lastMovingFrame = Time.frameCount;
            moveState = MoveState.Idle;
            boostsUsed = 0;

            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnRest());
        }
    }

    public int GetMaxBoosts() { return maxBoosts; }

    public int GetHealth() { return health; }

    public int GetBoostsLeft() { return maxBoosts - boostsUsed; }

    public bool IsDashing() {
        return (moveState == MoveState.Moving
            && isDashing) || lastMovingFrame == Time.frameCount;
    }

    public IEnumerable<GameObject> EnumInventory() {
        foreach( var item in inventory ) {
            if( item == null ) {
                Debug.LogError("null entry in player inventory!");
                continue;
            }
            yield return item.gameObject;
        }
    }

    public void RemoveFromInventory(GameObject obj) {
        inventory.Remove(obj);
    }

    public void AddToInventory(GameObject item) {
        inventory.Add(item);
    }

}
