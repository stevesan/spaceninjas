
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// Not physics-based.
public class HealthPowerup : MonoBehaviour {
    public Player player;

    void Start() {
        if(player == null) {
            player = GetComponentInParent<GameScope>().Get<Player>();
        }
    }

    void Update()
    {
        if( Vector3.Distance(transform.position, player.transform.position) < 0.5f ) {
            Health h = player.GetHealthComponent();
            h.ChangeHealth(1);
            Object.Destroy(gameObject);
        }
    }
}
