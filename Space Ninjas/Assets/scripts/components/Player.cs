using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections;
using System;

public class Player : MonoBehaviour {

    public interface EventHandler : IEventSystemHandler {
        void OnBoost( int boostsUsed, bool isDouble );
        void OnOutOfBoosts();
        void OnRest();
        void OnPickupCoin();
        void OnHealthChange(bool isHeal);
        void OnGracePeriodChange(bool sGracePeriod);
    }

    GameInput input = new GameInput();

    enum MoveState {Idle, Moving, Resting};

    float forceScale = 15f;
    int maxBoosts = 2;
    float minRestSecs = 0.00f;  // this doesn't feel great, but keep here just in case.
    int health = 5;

    float gracePeriod = 0f;

    private MoveState moveState = MoveState.Idle;
    private Dir2D moveDir = Dir2D.Right;
    private Dir2D lastMoveDir = Dir2D.Right;
    private Rigidbody2D rb;
    private int boostsUsed = 0;
    private float restedSecs = 0f;

	// Use this for initialization
	void Start () {
        rb = GetComponent<Rigidbody2D>();
	}

    void TriggerBoost(Dir2D dir) {
        if( boostsUsed < maxBoosts ) {
            boostsUsed++;
            bool isDouble = false;
            if( moveState == MoveState.Moving && dir != moveDir ) {
                rb.velocity = Vector2.zero;
            }
            else if( moveState == MoveState.Moving && dir == moveDir ) {
                // if same dir, allow extra boost of speed
                isDouble = true;
            }

            rb.AddForce(dir.GetVector2() * forceScale, ForceMode2D.Impulse);
            moveDir = dir;
            moveState = MoveState.Moving;

            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnBoost(boostsUsed, isDouble));
        }
        else {
            // out of boosts
            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnOutOfBoosts());
        }
    }
	
	void Update()
    {
        if( gracePeriod > 0f ) {
            gracePeriod -= Time.deltaTime;
            if( gracePeriod < 0f ) {
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(false));
            }
        }

        if( moveState == MoveState.Idle ) {
            // if idle and player was holding down a key, register a boost
            // but guard to make sure we don't spam it
            foreach( Dir2D dir in Enum.GetValues(typeof(Dir2D)) ) {
                // avoid spamming and trying in wrong direction
                if( dir == lastMoveDir ) {
                    continue;
                }
                if( input.IsHoldingMove(dir) ) {
                    TriggerBoost(dir);
                }
            }
        }
        else if( moveState == MoveState.Moving ) {
            // if moving, only respond to the down-frame
            foreach( Dir2D dir in Enum.GetValues(typeof(Dir2D)) ) {
                if( input.IsTriggerMove(dir) ) {
                    TriggerBoost(dir);
                }
            }
        }
        else {
            restedSecs += Time.fixedDeltaTime;
            if(restedSecs >= minRestSecs) {
                moveState = MoveState.Idle;
            }
        }
	}

    public void OnGetCoin(Coin coin) {
        ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnPickupCoin());
    }

    public void OnHeal(int amt) {
        OnHurt(-1 * amt);
    }

    public void OnHurt(int amt) {
        if( amt > 0 ) {
            if( gracePeriod > 0f ) {
                return;
            }
            else {
                gracePeriod = 2f;
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(true));
            }
        }
        health -= amt;
        ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnHealthChange(amt < 0));
    }

    void OnCollisionEnter2D( Collision2D col ) {
        if( moveState == MoveState.Moving ) {
            // move back slightly to not actually touch the block
            transform.position += (Vector3)col.contacts[0].normal * 0.1f;
            rb.velocity = Vector2.zero;
            moveState = MoveState.Resting;
            lastMoveDir = moveDir;
            boostsUsed = 0;
            restedSecs = 0f;

            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnRest());
        }
    }

    public int GetMaxBoosts() { return maxBoosts; }

    public int GetHealth() { return health; }

    public int GetBoostsLeft() { return maxBoosts - boostsUsed; }
}
