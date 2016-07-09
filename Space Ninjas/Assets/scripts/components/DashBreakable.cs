using UnityEngine;
using System.Collections;

public class DashBreakable : MonoBehaviour {

    public SpawnSpec spawnOnDestroy;

    public bool debug;

    public GameObject destroyVictim;    // set if this should destroy something aside from this.gameObject

    public void Start() {
        spawnOnDestroy.OnStart();
        if(destroyVictim == null) {
            destroyVictim = this.gameObject;
        }
    }

    string LogPrefix() {
        return gameObject.name + " ("+Time.frameCount+") ";
    }

    void OnCollisionEnter2D( Collision2D other ) {
        if( debug ) Debug.Log(LogPrefix() + ": hit " + other.gameObject.name);

        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            if( debug ) Debug.Log(LogPrefix() + "hit player " + other.gameObject.name);

            if( p.IsDashing() ) {
                if( debug ) Debug.Log(LogPrefix() + "dashing player " + other.gameObject.name);

                spawnOnDestroy.Spawn(transform);
                Object.Destroy(destroyVictim);
            }
        }
    }
}
