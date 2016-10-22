using UnityEngine;
using UnityEngine.EventSystems;
using System.Collections.Generic;

// Data every inventory item should have
public class Key : MonoBehaviour, InventoryItem.EventHandler {

    public int keyCode = -1;

    public void OnPickup(Player p) {
        // just hide ourselves
        gameObject.SetActive(false);
    }

}
