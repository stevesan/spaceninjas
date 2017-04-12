
using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections;

public class Health : MonoBehaviour {

    public interface Handler : IEventSystemHandler {
        void OnHealthChange(int prevHealth);
    }

    public static Health GetRelevantHealthComponent(GameObject obj) {
        return obj.GetComponentInParent<Health>();
    }

    public static int GetRelevantHealth(GameObject obj) {
        Health h = GetRelevantHealthComponent(obj);
        if( h == null ) {
            return -1;
        }
        else {
            return h.Get();
        }
    }

    public static bool IsDead(GameObject obj) {
        return GetRelevantHealth(obj) <= 0;
    }

    public int health = 1;
    public int maxHealth = -1;

    public bool destroyOnNoHealth;
    public MultiSpawnSpec spawnsOnDestroy;
    public MultiSpawnSpec spawnsOnHarm;
    public GameObject destroyVictim;    // set if this should destroy something aside from this.gameObject

    public void Start() {
        if(spawnsOnDestroy != null) {
            spawnsOnDestroy.OnStart();
        }
        if(spawnsOnHarm != null) {
            spawnsOnHarm.OnStart();
        }
    }

    public int Get() { return health; }

    public bool ChangeHealth(int delta) {
        if( delta == 0) {
            return false;
        }

        if(health == maxHealth) {
            return false;
        }

        int prevHealth = health;
        health += delta;

        if(health > maxHealth) {
            health = maxHealth;
        }

        if(health == 0 && destroyOnNoHealth ) {
            //Debug.Log(transform.GetComponentInParent<GameScope>().gameObject.name);

            foreach( var s in spawnsOnDestroy.Spawn(transform) ) { }
            Object.Destroy(destroyVictim == null ? this.gameObject : destroyVictim);
        }
        else {
            if( delta < 0 ) {
                foreach( var s in spawnsOnHarm.Spawn(transform) ) { }
            }
            ExecuteEvents.Execute<Handler>(this.gameObject, null, (x,y)=>x.OnHealthChange(prevHealth));
        }

        return true;
    }
}

