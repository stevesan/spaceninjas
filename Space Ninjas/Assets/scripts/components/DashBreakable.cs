using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections;

public class DashBreakable : MonoBehaviour {

    public interface EventHandler : IEventSystemHandler {
        void OnDashed(Player p);
    }

    public MultiSpawnSpec spawnsOnDestroy;

    public GameObject destroyVictim;    // set if this should destroy something aside from this.gameObject

    public void Start() {
        spawnsOnDestroy.OnStart();
    }

    string LogPrefix() {
        return gameObject.name + " ("+Time.frameCount+") ";
    }

    void OnCollisionEnter2D( Collision2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            if( p.IsDashing() ) {
                ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnDashed(p));
                foreach( var s in spawnsOnDestroy.Spawn(transform) ) { }
                Object.Destroy(destroyVictim == null ? this.gameObject : destroyVictim);
            }
        }
    }
}
