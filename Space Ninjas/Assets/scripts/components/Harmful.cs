using UnityEngine;
using System.Collections;

public class Harmful : MonoBehaviour {

    public int hurtAmount = 1;

    public bool destroyOnHarm = false;

    public SpawnSpec onHarm;

	// Use this for initialization
	void Start () {
        onHarm.OnStart();
	}

    void OnTouch(GameObject other) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            if( p.OnHurt(hurtAmount) ) {
                onHarm.Spawn(transform);
            }

            if(destroyOnHarm) {
                Object.Destroy(gameObject);
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
