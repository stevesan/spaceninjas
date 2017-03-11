
using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections;

public class Health : MonoBehaviour {

    public interface EventHandler : IEventSystemHandler {
        void OnHealthChange();
    }

    public int health = 1;

    public bool destroyOnNoHealth;
    public MultiSpawnSpec spawnsOnDestroy;
    public GameObject destroyVictim;    // set if this should destroy something aside from this.gameObject

    public void Start() {
        if(spawnsOnDestroy != null) {
            spawnsOnDestroy.OnStart();
        }
    }

    public bool ChangeHealth(int delta) {
        if( delta == 0) {
            return false;
        }

        health += delta;

        if(health == 0 && destroyOnNoHealth ) {
            //Debug.Log(transform.GetComponentInParent<GameScope>().gameObject.name);

            foreach( var s in spawnsOnDestroy.Spawn(transform) ) { }
            Object.Destroy(destroyVictim == null ? this.gameObject : destroyVictim);
        }
        else {
            ExecuteEvents.Execute<EventHandler>(this.gameObject, null, (x,y)=>x.OnHealthChange());
        }

        return true;
    }
}

