using UnityEngine;
using System.Collections;

public class Coin : MonoBehaviour {

	// Use this for initialization
	void Start () {
        // random rotation, for variety
        transform.Rotate(Vector3.forward * Random.value * 360f);
	}
	
	// Update is called once per frame
	void Update () {
	
	}

    void OnTriggerEnter2D( Collider2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            p.OnGetCoin(this);
            Object.Destroy(this.gameObject);
        }
    }
}
