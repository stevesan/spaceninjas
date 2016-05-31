using UnityEngine;
using System.Collections;

public class DashBreakable : MonoBehaviour {

    void OnCollisionEnter2D( Collision2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            if( p.IsDashing() ) {
                Object.Destroy(gameObject);
            }
        }
    }
}
