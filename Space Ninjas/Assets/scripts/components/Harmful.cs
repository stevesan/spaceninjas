using UnityEngine;
using System.Collections;

public class Harmful : MonoBehaviour {

    public int hurtAmount = 1;

    // Should this object be destroyed upon inflicting harm? Such as a missile exploding.
    public bool destroyOnHarm = false;

    // What effect to spawn when this object inflicts health? Such as, the explosion from a missile.
    public SpawnSpec onHarm;

	// Use this for initialization
	void Start () {
        onHarm.OnStart();
	}

    void OnTouch(GameObject other) {

        //Debug.Log(gameObject.name + " touched " + other.name);
        if( !this.enabled ) {
            return;
        }

        if( other.transform.IsChildOf(this.transform) ) {
            return;
        }

        if( this.transform.IsChildOf(other.transform) ) {
            return;
        }

        Health h = other.GetComponentInParent<Health>();
        // If health is disabled, assume it's invulnerable
        if( h != null && h.enabled ) {
            if( h.ChangeHealth(-1 * hurtAmount) ) {
                onHarm.Spawn(transform);
                if(destroyOnHarm) {
                    Object.Destroy(gameObject);
                }
            }
        }
    }

    void OnCollisionEnter2D( Collision2D other ) {
        // Important to use other.collider. instead of just other.
        // 'other.gameObject' will be the rigidbody, which is usually the root.
        // But, if we hit a collider that was not vulnerable, we don't want to do harm.
        // So, we need to distinguish between which collider was hit.
        OnTouch(other.collider.gameObject);
    }

    void OnTriggerEnter2D( Collider2D other ) {
        OnTouch(other.gameObject);
    }

    void OnTriggerStay2D( Collider2D other ) {
        OnTouch( other.gameObject );
    }
}
