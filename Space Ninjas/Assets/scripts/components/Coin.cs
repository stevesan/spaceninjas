using UnityEngine;
using System.Collections;

public class Coin : MonoBehaviour {

    public OrbState manager;

    void Awake() {
        if(manager == null) {
            manager = GetComponentInParent<OrbState>();
        }
        if(manager == null) {
            Debug.LogError("Could not find OrbState in ancestors");
        }
    }

	// Use this for initialization
	void Start () {
        // random rotation, for variety
        transform.Rotate(Vector3.forward * Random.value * 360f);
	}

    void OnEnable() {
        manager.OrbAdded();
    }

    void OnDisable() {
        manager.OrbRemoved();
    }

    void OnTriggerEnter2D( Collider2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            p.OnGetCoin(this);
            Object.Destroy(this.gameObject);
            manager.OrbGot();
        }
    }
}
