using UnityEngine;
using System.Collections;

public class Door : MonoBehaviour {
    
    // Door can only be opened by a key with the same code
    public int keyCode = 0;

    void OnCollisionEnter2D( Collision2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            Key keyToUse = null;
            foreach( GameObject item in p.EnumInventory() ) {
                var key = item.GetComponent<Key>();
                if( key != null && key.keyCode == keyCode) {
                    keyToUse = key;
                    break;
                }
            }

            if( keyToUse != null ) {
                Debug.Log("player has right key - opening");
                p.RemoveFromInventory(keyToUse.gameObject);
                Destroy(keyToUse.gameObject);
                // remove door obstacle
                Destroy(gameObject);
            }
            else {
                Debug.Log("didn't have key " + keyCode);
            }
        }
    }
}
