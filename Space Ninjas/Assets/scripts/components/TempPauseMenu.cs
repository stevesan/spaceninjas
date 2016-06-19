
using UnityEngine;

public class TempPauseMenu : Main.PauseMenu {

    private Main main;

    private int[] targetFrameRates = {30, 60};

    void OnActive() {
        Debug.Log("fdsfd");
    }

    public override void Activate(Main main) {
        this.main = main;
    }

    void OnGUI() {
        if(GUILayout.Button("Unpause")) {
            main.Unpause();
            return;
        }

        GUILayout.Label("Target framerate: " + Application.targetFrameRate);

        foreach( int fps in targetFrameRates ) {
            if(GUILayout.Button("Set "+fps)) {
                Application.targetFrameRate = fps;
            }
        }
    }
}
