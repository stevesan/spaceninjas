using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using System;

public class Player : MonoBehaviour {

    // TODO make this a separate component
    class CollisionDebugger {
        ContactPoint2D[] lastContacts = null;

        public void OnCollision(Collision2D col) {
           lastContacts = col.contacts;
        } 

        public void Update() {
            if(lastContacts != null) {
                foreach( var con in lastContacts ) {
                    Debug.DrawLine(con.point, con.point + con.normal*5f);
                }
            }
        }
    }

    private CollisionDebugger colDebug = new CollisionDebugger();

    public interface EventHandler : IEventSystemHandler {
        void OnBoost( bool isDash, Dir2D dir );
        void OnRest(Vector3 restNormal);
        void OnPickupCoin();
        void OnHealthChange(bool isHeal);
        void OnGracePeriodChange(bool sGracePeriod);
    }

    // Should be an interface...but Unity Editor does not support interface fields
    public abstract class Input : MonoBehaviour {
        public abstract bool IsTriggerMove( Dir2D dir );
        public abstract void PreUpdate(float dt);
    }

    // scope-bound
    private Input input;
    private Main main;

    public SpawnSpec onHurt;

    public List<GameObject> inventory;

    enum MoveState {Idle, Moving, Dashing};

    float speed = 8f;
    int health = 5;
    int maxHealth = 5;

    float gracePeriod = 0f;

    private MoveState moveState = MoveState.Idle;
    private float lastBoostTimeForDashDetection = 0f;
    private Dir2D lastBoostDir = Dir2D.Right;
    private float lastDashingTime = 0f;

    private Harmful harmer;

    private Rigidbody2D rb;

    public Camera mainCam;

	// Use this for initialization
	void Start () {
        rb = GetComponent<Rigidbody2D>();
        onHurt.OnStart();

        var scope = GetComponentInParent<GameScope>();
        input = scope.Get<Input>();
        main = scope.Get<Main>();

        harmer = GetComponentInParent<Harmful>();
        harmer.enabled = false;
	}

    void UpdateGracePeriod() {
        if( gracePeriod > 0f ) {
            gracePeriod -= Time.deltaTime;
            if( gracePeriod < 0f ) {
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(false));
            }
        }
    }

    bool IsAnyDirTriggered() {
        foreach( Dir2D dir in Enum.GetValues(typeof(Dir2D)) ) {
            if( input.IsTriggerMove(dir) ) {
                return true;
            }
        }
        return false;
    }

    Dir2D GetMoveDirTriggered() {
        foreach( Dir2D dir in Enum.GetValues(typeof(Dir2D)) ) {
            if( input.IsTriggerMove(dir) ) {
                return dir;
            }
        }
        Debug.LogError("Called when no dir was triggered!");
        return Dir2D.Right;
    }

    void Boost(Dir2D dir, bool isDash) {
        rb.AddStoppingForce();
        float finalSpeed = isDash ? 2f * speed : speed;
        rb.AddForce(dir.GetVector2() * finalSpeed * rb.mass, ForceMode2D.Impulse);
        moveState = isDash ? MoveState.Dashing : MoveState.Moving;
        ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnBoost(isDash, dir));
    }

	void Update()
    {
        colDebug.Update();
        input.PreUpdate(Time.deltaTime);

        UpdateGracePeriod();

        // We allow motion and dashing from any state...
        // ..because we want to allow dashing from idle, ie. dashing into a wall you're already touching.
        if(IsAnyDirTriggered()) {
            bool isDash =
                (lastBoostDir == GetMoveDirTriggered())
                && (Time.time - lastBoostTimeForDashDetection < 0.3f);
            lastBoostDir = GetMoveDirTriggered();

            // commenting this out. The difference is, if you press a dir soon after a boost, should you boost again or go back to normal speed?
            //if( isDash ) {
                //lastBoostTimeForDashDetection = 0f;
            //}
            //else {
                lastBoostTimeForDashDetection = Time.time;
            //}
            Boost(lastBoostDir, isDash);
        }

        if( moveState == MoveState.Dashing ) {
            lastDashingTime = Time.time;
        }

        harmer.enabled = (moveState == MoveState.Dashing);

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
        colDebug.OnCollision(col);

        if( moveState != MoveState.Idle ) {
            // If direction of collision is opposite our moving dir, stop
            Vector2 normal = col.contacts[0].normal;

            if( Vector2.Dot(normal, lastBoostDir.GetVector2()) < 0f ) {
                rb.AddStoppingForce();
                // put us a bit away from the wall so we don't "grind" along it for parallel motion
                transform.position += (Vector3)normal * 0.1f;
                moveState = MoveState.Idle;
                ExecuteEvents.Execute<EventHandler>(
                        this.gameObject,
                        null,
                        (x,y)=>x.OnRest((Vector3)normal));
            }
        }
    }

    public int GetHealth() { return health; }

    public bool IsDashing() {
        // We need this, since we often hit something and stop dashing in the same frame.
        // So, we must guarantee that whatever we hit gets "dashed"
        return Time.time - lastDashingTime < 0.1f;
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

    public float GetVisibilityBoxRadius() {
        // not sure why I have to add 1 to this...but this is from empirical truth.
        return mainCam.orthographicSize/2f + 1f;
    }

    public bool CanSee(Transform other, float radius, float blindMargin) {
        float dx = Mathf.Abs(other.position.x - transform.position.x);
        float dy = Mathf.Abs(other.position.y - transform.position.y);
        return Mathf.Max(dx, dy) - radius < GetVisibilityBoxRadius() - blindMargin;
    }
}
