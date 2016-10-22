using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;

// Data every inventory item should have
public class InventoryItem : MonoBehaviour {

    public interface EventHandler : IEventSystemHandler {
        void OnPickup(Player p);
    }

    public string displayName;

    void OnTouch(GameObject toucher) {
        Player p = toucher.GetComponentInParent<Player>();
        if( p != null ) {
            Debug.Log("Adding to inventory: " + gameObject.name);
            p.AddToInventory(gameObject);
            ExecuteEvents.Execute<EventHandler>(gameObject, null, (x,y)=>x.OnPickup(p));
        }
    }

    void OnTriggerEnter2D(Collider2D other) {
        OnTouch(other.gameObject);
    }

    void OnCollisionEnter2D( Collision2D other ) {
        OnTouch(other.gameObject);
    }
}
