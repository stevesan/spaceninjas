using UnityEngine;
using System.Collections;

// Shoots at the player
public class Chaser : MonoBehaviour {

    public float maxTargetDist = 10f;
    public float speed = 1f;
    public Transform target;
    public float backoffTime = 1f;

    private Rigidbody2D rb;

    enum Mode { Chase, Backoff };
    private Mode mode = Mode.Chase;

    private Vector2 backoffDir;
    private float backoffTimer = 0f;

    void Awake() {
        if(target == null) {
            target = GetComponentInParent<Main>().GetPlayer().transform;
            Debug.Assert(target != null);
        }
    }

	void Start () {
        rb = GetComponent<Rigidbody2D>();
	}

    public bool IsTargetCloseEnough() {
        return Vector3.Distance(transform.position, target.position) < maxTargetDist;
    }

    void Update() {
        if( mode == Mode.Chase ) {
            if( IsTargetCloseEnough() ) {
                Vector2 dir = (target.position - transform.position).GetXY();
                rb.velocity = dir.normalized * speed;
            }
            else {
                rb.velocity = Vector3.zero;
            }
        }
        else if( mode == Mode.Backoff ) {
            rb.velocity = backoffDir * speed;

            backoffTimer -= Time.deltaTime;
            if( backoffTimer < 0f ) {
                mode = Mode.Chase;
            }
        }
    }

    void OnCollisionEnter2D( Collision2D col ) {
        if( mode == Mode.Chase ) {
            mode = Mode.Backoff;
            backoffDir = (Vector3)col.contacts[0].normal;
            // randomly rotate a bit
            float degs = Mathf.Lerp( -60, 60, Random.value );
            backoffDir = backoffDir.Rotated(degs);
            backoffTimer = backoffTime;
        }
    }

}
