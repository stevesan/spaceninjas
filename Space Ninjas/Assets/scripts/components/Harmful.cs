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
        if( !this.enabled ) {
            return;
        }

        if( other.transform.IsChildOf(this.transform) ) {
            return;
        }

        Health h = other.GetComponentInParent<Health>();
        if( h != null ) {
            if( h.ChangeHealth(-1 * hurtAmount) ) {
                onHarm.Spawn(transform);
                if(destroyOnHarm) {
                    Object.Destroy(gameObject);
                }
            }
        }
    }

    void OnCollisionEnter2D( Collision2D other ) {
        OnTouch(other.gameObject);
    }

    void OnTriggerEnter2D( Collider2D other ) {
        OnTouch(other.gameObject);
    }

    void OnTriggerStay2D( Collider2D other ) {
        OnTouch( other.gameObject );
    }
}
