using UnityEngine;
using System.Collections;

// Data every inventory item should have
public class Key : MonoBehaviour {
    public int keyCode = 0;

    void OnCollisionEnter2D( Collision2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            p.AddToInventory(gameObject);
            gameObject.SetActive(false);
            Debug.Log("Got key " + keyCode);
        }
    }
}
