
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System;

// Effects for player state and events
public class InventoryHUD : MonoBehaviour {
    private Player player;
    private Text text;
    private string prevDisplay = null;

    void Start() {
        var scope = GetComponentInParent<GameScope>();
        player = scope.Get<Player>();
        text = GetComponent<Text>();
    }

    string GetCurrentInvString() {
        string rv = "";
        foreach( var item in player.EnumInventory() ) {
            rv += item.GetComponent<InventoryItem>().displayName;
            Debug.Log(item.name);
        }
        return rv;
    }

    void Update() {
        string currStr = GetCurrentInvString();
        if( currStr != text.text ) {
            text.text = currStr;
        }
    }
}
