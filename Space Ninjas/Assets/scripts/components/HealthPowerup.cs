
using UnityEngine;
using UnityEngine.UI;
using System.Collections;

// Not physics-based.
public class HealthPowerup : MonoBehaviour {
    public Player player;

    void Start() {
        if(player == null) {
            Debug.Assert(GetComponentInParent<Main>() != null);
            player = GetComponentInParent<Main>().GetPlayer();
        }
    }

    void Update()
    {
        if( Vector3.Distance(transform.position, player.transform.position) < 0.5f ) {
            player.OnHeal(1);
            Object.Destroy(gameObject);
        }
    }
}
