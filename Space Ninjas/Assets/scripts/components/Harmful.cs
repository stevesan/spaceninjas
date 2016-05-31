using UnityEngine;
using System.Collections;

public class Harmful : MonoBehaviour {

    public int hurtAmount = 1;

    public bool destroyOnHarm = false;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

    void OnCollisionEnter2D( Collision2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            p.OnHurt(hurtAmount);
        }
    }

    void OnTriggerEnter2D( Collider2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            p.OnHurt(hurtAmount);

            if(destroyOnHarm) {
                Object.Destroy(gameObject);
            }
        }
    }
}
