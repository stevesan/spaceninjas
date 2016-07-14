
using UnityEngine;
using UnityEngine.UI;
using System.Collections;
using System.Collections.Generic;

// Keeps the object rotated towards a target
public class OrbState : MonoBehaviour {

    private int totalOrbs = 0;
    private int orbsGotten = 0;

    public Text hudText;
    private bool updateQueued = false;

    void Update() {
        if(updateQueued) {
            UpdateHud();
            updateQueued = false;
        }
    }

    void UpdateHud() {
        int total = 0;
        hudText.text = orbsGotten + "/" + totalOrbs + " orbs";
    }

    public void OrbAdded() {
        totalOrbs++;
        updateQueued = true;
    }

    public void OrbRemoved() {
        totalOrbs--;
        updateQueued = true;
    }

    public void OrbGot() {
        orbsGotten++;
        totalOrbs++;
        updateQueued = true;
    }
}
