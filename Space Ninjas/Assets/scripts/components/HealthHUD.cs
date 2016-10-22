
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;

// Effects for player state and events
public class HealthHUD : MonoBehaviour {
    private Player player;
    private Text text;
    private int prevHealth = -1;

    void Start() {
        var scope = GetComponentInParent<GameScope>();
        player = scope.Get<Player>();
        prevHealth = -1;

        text = GetComponent<Text>();
    }

    void Update() {
        if( prevHealth != player.GetHealth() ) {
            text.text = "";
            for( int i = 0; i < player.GetHealth(); i++ ) {
                text.text += "O";
            }
        }
    }
}
