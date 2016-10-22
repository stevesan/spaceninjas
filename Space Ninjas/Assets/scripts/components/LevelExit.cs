using UnityEngine;

// When you need to spawn something and want to specify how
public class LevelExit : MonoBehaviour
{
    public string nextLevelName;

    void OnTriggerEnter2D( Collider2D other ) {
        Player p = other.gameObject.GetComponentInParent<Player>();
        if( p != null ) {
            Application.LoadLevel(nextLevelName);
        }
    }
}
