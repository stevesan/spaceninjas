using UnityEngine;
using System.Collections;
using UnityEngine.EventSystems;

public class Harmful : MonoBehaviour {

    public interface Handler : IEventSystemHandler {
        void OnDidHarm(Health victim);
    }

    public int hurtAmount = 1;
    public bool hurtPlayerOnly = true;

    // Should this object be destroyed upon inflicting harm? Such as a missile exploding.
    public bool destroyOnHarm = false;

    // What effect to spawn when this object inflicts health? Such as, the explosion from a missile.
    public SpawnSpec onHarm;

	// Use this for initialization
	public void Start () {
        onHarm.OnStart();
	}

    // Returns true if harm was done to the given other
    public bool OnTouch(GameObject other) {
        if( other.transform.IsChildOf(this.transform) ) {
            return false;
        }

        if( this.transform.IsChildOf(other.transform) ) {
            return false;
        }

        Health h = Health.GetRelevantHealthComponent(other);
        Player p = other.GetComponentInParent<Player>();

        // If health is disabled, assume it's invulnerable
        if( h != null && h.enabled && (!hurtPlayerOnly || p != null) ) {
            Debug.Log(this.gameObject.name + " damaging " + h.gameObject.name + " x " + hurtAmount);
            if( h.ChangeHealth(-1 * hurtAmount, this.gameObject) ) {
                onHarm.Spawn(transform);
                ExecuteEvents.Execute<Handler>(this.gameObject, null, (x,y)=>x.OnDidHarm(h));
                if(destroyOnHarm) {
                    Object.Destroy(gameObject);
                }
                return true;
            }
        }

        return false;
    }

    void OnCollisionEnter2D( Collision2D col ) {
        // Important to use col.collider instead of just col.
        // 'col.gameObject' will be the rigidbody, which is usually the root.
        // But, if we hit a collider that was not vulnerable, we don't want to do harm.
        // So, we need to distinguish between which collider was hit.
        if(this.enabled) {
            OnTouch(col.collider.gameObject);
        }
    }

    void OnTriggerEnter2D( Collider2D other ) {
        if(this.enabled) {
            OnTouch(other.gameObject);
        }
    }

    void OnTriggerStay2D( Collider2D other ) {
        if(this.enabled) {
            OnTouch( other.gameObject );
        }
    }
}
