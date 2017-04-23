using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;
using System;

public class Player : MonoBehaviour, Health.Handler {

    private static bool EnableDashThrough = true;

    // As opposed to dash being unlimited, and you can cancel it anytime.
    // Uncontrolled is: dash has limited max time, and you can't cancel it with buttons.
    private static bool UncontrolledDash = false;

    private static bool AutostopDash = false;
    private static float AutostopDashTime = 0.30f;

    private static float normalSpeed = 8f;  // used to be 8..
    private static float autostopDashSpeed = 23;
    private static float dashSpeed = 16f;
    private static int maxHealth = 5;

    private static float gracePeriod = 1.0f;

    private static void log(string msg) {
        Debug.Log( "(" + Time.frameCount + ") " + msg);
    }

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
        void OnMove( bool isDash, Dir2D dir );
        void OnRest(Vector3 restNormal);
        void OnPickupCoin();
        void OnHealthChange(bool isHeal);
        void OnGracePeriodChange(bool sGracePeriod);
        void OnLandedHit(GameObject victim);
    }

    // Should be an interface...but Unity Editor does not support interface fields
    public abstract class Input : MonoBehaviour {
        public abstract bool IsTriggerMove( Dir2D dir );
        public abstract bool IsHoldingMove( Dir2D dir );
        public abstract void PreUpdate(float dt);
    }

    // scope-bound
    private Input input;
    private Main main;

    public SpawnSpec onHurt;

    public List<GameObject> inventory;

    enum MoveState {Idle, Moving, Dashing, DashingLastFrame};

    static bool IsDashingState(MoveState state) {
        return state == MoveState.Dashing
            || state == MoveState.DashingLastFrame;
    }


    float graceRemainSecs = 0f;

    private MoveState moveState = MoveState.Idle;
    private float lastDashTriggerTime = 0f;

    // only meaningful if moveState in [Moving, Dashing]
    private float lastMoveTriggerTime = 0f;
    private Dir2D lastMoveDir = Dir2D.Right;    

    private Harmful harmer;
    private Health health;

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
        // we will manage all harmer inputs/events ourselves.
        harmer.enabled = false;
        harmer.Start();

        health = GetComponentInParent<Health>();
	}

    void UpdateGracePeriod() {
        if( graceRemainSecs > 0f ) {
            graceRemainSecs -= Time.deltaTime;
            if( graceRemainSecs < 0f ) {
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(false));
                health.enabled = true;
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

    void Move(Dir2D dir, bool isDash) {
        rb.AddStoppingForce();
        float currSpeed = isDash ? (AutostopDash ? autostopDashSpeed : dashSpeed) : normalSpeed;
        rb.AddForce(dir.GetVector2() * currSpeed * rb.mass, ForceMode2D.Impulse);
        moveState = isDash ? MoveState.Dashing : MoveState.Moving;
        ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnMove(isDash, dir));
    }

    void UpdateMoveState() {
        if(moveState == MoveState.DashingLastFrame) {
            moveState = MoveState.Idle;
        }

        if(AutostopDash && IsDashingState(moveState)) {
            // allow no change until dash is done
            if( Time.time - lastDashTriggerTime > AutostopDashTime ) {
                // back to normal moving
                Move(lastMoveDir, false);
            }
        }

        if(UncontrolledDash && IsDashingState(moveState))
        {
            // allow no input to cancel dashing
            return;
        }

        // We allow motion and dashing from any state...
        // ..because we want to allow dashing from idle, ie. dashing into a wall you're already touching.
        if(IsAnyDirTriggered()) {
            bool dashTriggered =
                (lastMoveDir == GetMoveDirTriggered())
                && (Time.time - lastDashTriggerTime > 0.0f)    // cooldown
                && (Time.time - lastMoveTriggerTime < 0.3f); // double-tap
            bool isDirChange = moveState == MoveState.Idle || lastMoveDir != GetMoveDirTriggered();

            lastMoveDir = GetMoveDirTriggered();
            lastMoveTriggerTime = Time.time;
            if(dashTriggered) {
                // used to enforce dash cooldown
                lastDashTriggerTime = Time.time;

                lastMoveTriggerTime = 0f;   // don't let the next tap result in another dash
            }

            if( dashTriggered || isDirChange ) {
                Move(lastMoveDir, dashTriggered);
            }
        }
    }

	void Update()
    {
        colDebug.Update();
        input.PreUpdate(Time.deltaTime);

        UpdateGracePeriod();

        UpdateMoveState();

        if(GetHealth() <= 0) {
            main.OnGameOver();
        }
	}

    public void OnGetCoin(Coin coin) {
        ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnPickupCoin());
    }

    public void OnHealthChange(int prevHealth) {
        if( health.Get() < prevHealth ) {
            // hurting
            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnHealthChange(false));

            // initialize grace period
            graceRemainSecs = gracePeriod;
            health.enabled = false;
            onHurt.Spawn(transform);
            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnGracePeriodChange(true));
        }
        else if( health.Get() > prevHealth ) {
            // healing
            // TODO enforce max health here..?
            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnHealthChange(true));
        }
    }

    void MaybeStopDueToCollision(Collision2D col) {
        // If direction of collision is opposite our moving dir, stop
        Vector2 normal = col.contacts[0].normal;

        if( Vector2.Dot(normal, lastMoveDir.GetVector2()) < 0f ) {
            rb.AddStoppingForce();
            // put us a bit away from the wall so we don't "grind" along it for parallel motion
            transform.position += (Vector3)normal * 0.1f;

            if(moveState == MoveState.Dashing) {
                moveState = MoveState.DashingLastFrame;
            }
            else {
                moveState = MoveState.Idle;
            }
            ExecuteEvents.Execute<EventHandler>(
                    this.gameObject,
                    null,
                    (x,y)=>x.OnRest((Vector3)normal));
        }
    }

    void OnCollisionEnter2D( Collision2D col ) {
        colDebug.OnCollision(col);

        if( moveState != MoveState.Idle ) {
            if(IsDashingState(moveState)) {
                if(harmer.OnTouch(col.collider.gameObject)) {
                    if(EnableDashThrough
                            && Health.IsDead(col.collider.gameObject))
                    {
                        Move(lastMoveDir, true);
                    }
                    else {
                        MaybeStopDueToCollision(col);
                    }

                    ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnLandedHit(col.collider.gameObject));
                }
                else {
                    MaybeStopDueToCollision(col);
                }
            }
            else {
                MaybeStopDueToCollision(col);
            }
        }
    }

    public int GetHealth() { return health.Get(); }

    public Health GetHealthComponent() { return health; }

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

    public bool IsDashing() {
        return IsDashingState(moveState);
    }

    public bool IsMoving() {
        return moveState != MoveState.Idle;
    }

    public Dir2D GetLastMoveDir() {
        return lastMoveDir;
    }
}
