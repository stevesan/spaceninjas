using UnityEngine;
using System.Collections;

// Data every inventory item should have
public class Key : MonoBehaviour {
    public int keyCode = 0;

    void OnTouch(GameObject toucher) {
        Player p = toucher.GetComponentInParent<Player>();
        if( p != null ) {
            p.AddToInventory(gameObject);
            gameObject.SetActive(false);
            Debug.Log("Got key " + keyCode);
        }
    }

    void OnTriggerEnter2D(Collider2D other) {
        OnTouch(other.gameObject);
    }

    void OnCollisionEnter2D( Collision2D other ) {
        OnTouch(other.gameObject);
    }
}
