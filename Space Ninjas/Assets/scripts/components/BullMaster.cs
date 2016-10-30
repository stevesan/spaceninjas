using UnityEngine;
using System.Collections;

// Master component for the 'bull' enemy type
public class BullMaster : MonoBehaviour {
    // Shared buffer. Obviously not thread-safe, should be immediately used and read, etc.
    private static RaycastHit2D[] SHARED_HIT_BUFFER = new RaycastHit2D[64];

    static float chargeSpeed = 17f;
    static float chargeTime = 1f;
    static float minChargeDist = 10f;
    static float castRadius = 0.5f;
    static float restTime = 1.5f;
    static float prechargeTime = 0.5f;

    public Renderer sprite;

    private LaserBeam laser;
    private Chaser chasing;
    private Rigidbody2D rb;

    private enum State { Chasing, Precharge, Charging, Resting };
    private State state = State.Chasing;
    private float restTimer = 0f;
    private float chargeTimer = 0f;
    private float prechargeTimer = 0f;
    private Player targetPlayer;

    void Start() {
        chasing = GetComponent<Chaser>();
        rb = GetComponent<Rigidbody2D>();
        laser = GetComponent<LaserBeam>();

        if(targetPlayer == null) {
            targetPlayer = GetComponentInParent<GameScope>().Get<Player>();
            Debug.Assert(targetPlayer != null);
        }
        chasing.SetTarget(targetPlayer.transform);
    }

    void PointRightAtTarget() {
        transform.PointRightAt(targetPlayer.transform.position);
    }

    bool CanHitTarget() {
        // see if we have a clear shot at the player
        Physics2D.queriesHitTriggers = false;
        var toTarget = (targetPlayer.transform.position - transform.position).normalized;
        int numHits = Physics2D.CircleCastNonAlloc( transform.position, castRadius, toTarget, SHARED_HIT_BUFFER, chasing.maxTargetDist );
        for( int i = 0; i < numHits; i++ ) {
            var hit = SHARED_HIT_BUFFER[i];
            if( hit.transform.IsChildOf(transform) ) {
                // ignore ourself as an obstacle
                continue;
            }

            if(hit.transform.IsChildOf(targetPlayer.transform) ) {
                // can hit the target!
                return true;
            }

            // we must've hit something else - cannot hit target.
            return false;
        }

        // no hits - target may be too far
        return false;
    }

    void UpdateDebugDraws() {
    }

    void Update() {
        UpdateDebugDraws();

        if( state == State.Chasing ) {
            PointRightAtTarget();
            chasing.enabled = true;

            bool closeEnough = targetPlayer.CanSee(transform, 0.5f, 1.5f);

            if( closeEnough && CanHitTarget() ) {
                Precharge();
            }
        }
        else if( state == State.Precharge ) {
            // flash the sprite
            sprite.enabled = Util.SquareWave(8f);
            PointRightAtTarget();

            prechargeTimer -= Time.deltaTime;

            if( prechargeTimer < 0f ) {
                Charge();
            }
        }
        else if( state == State.Charging ) {
            chargeTimer -= Time.deltaTime;
            if( chargeTimer < 0f ) {
                Rest();
            }
        }
        else if( state == State.Resting ) {
            rb.AddStoppingForce();
            restTimer -= Time.deltaTime;
            if( restTimer < 0f ) {
                state = State.Chasing;
            }
        }
    }

    void Precharge() {
        state = State.Precharge;
        prechargeTimer = prechargeTime;
        chasing.enabled = false;
        rb.AddStoppingForce();
    }

    void Charge() {
        sprite.enabled = true;
        chasing.enabled = false;
        rb.AddStoppingForce();
        var toTarget = (targetPlayer.transform.position - transform.position).normalized;
        rb.AddForce( toTarget.GetXY() * chargeSpeed * rb.mass, ForceMode2D.Impulse );
        PointRightAtTarget();
        state = State.Charging;
        chargeTimer = chargeTime;
    }

    void Rest() {
        rb.AddStoppingForce();
        state = State.Resting;
        restTimer = restTime;
        sprite.enabled = true;
        chasing.enabled = false;
    }

    void OnCollisionEnter2D( Collision2D other ) {
        if( state == State.Charging ) {
            Rest();
        }
    }
}
