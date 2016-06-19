using UnityEngine;
using System.Collections;

public class DashBreakable : MonoBehaviour {

    public SpawnSpec spawnOnDestroy;

    public void Start() {
        spawnOnDestroy.OnStart();
    }

    void OnCollisionEnter2D( Collision2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            if( p.IsDashing() ) {
                Object.Destroy(gameObject);

                if(spawnOnDestroy.IsValid()) {
                    spawnOnDestroy.Spawn(transform);
                }
            }
        }
    }
}
