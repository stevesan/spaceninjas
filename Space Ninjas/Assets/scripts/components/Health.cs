
using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections;

public class Health : MonoBehaviour {

    public interface Handler : IEventSystemHandler {
        void OnHealthChange(int prevHealth);
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

    public int Get() { return health; }

    public bool ChangeHealth(int delta) {
        if( delta == 0) {
            return false;
        }

        int prevHealth = health;
        health += delta;

        if(health == 0 && destroyOnNoHealth ) {
            //Debug.Log(transform.GetComponentInParent<GameScope>().gameObject.name);

            foreach( var s in spawnsOnDestroy.Spawn(transform) ) { }
            Object.Destroy(destroyVictim == null ? this.gameObject : destroyVictim);
        }
        else {
            ExecuteEvents.Execute<Handler>(this.gameObject, null, (x,y)=>x.OnHealthChange(prevHealth));
        }

        return true;
    }
}

