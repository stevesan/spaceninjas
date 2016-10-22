using UnityEngine;
using System.Collections;

public class Coin : MonoBehaviour {

    public OrbState manager;

    void Awake() {
    }

	// Use this for initialization
	void Start () {
        // random rotation, for variety
        transform.Rotate(Vector3.forward * Random.value * 360f);

        if(manager == null) {
            manager = GetComponentInParent<GameScope>().Get<OrbState>();
        }
        if(manager == null) {
            Debug.LogError("Could not find OrbState in ancestors");
        }
        manager.OrbAdded();
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
