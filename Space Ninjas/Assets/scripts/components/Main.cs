using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class Main : MonoBehaviour {

    public abstract class PauseMenu : MonoBehaviour {
        public abstract void Activate(Main main);
    }

    public PauseMenu pauseMenu;

    private Player player;

    int lastMinute = -1;

    public Player GetPlayer() { return player; }
    public void SetPlayer(Player p) {player = p;}

	// Use this for initialization
	void Start () {
        // for IOS, must set this for 60 FPS
        Application.targetFrameRate = 60;

        Unpause();
	}
	
	// Update is called once per frame
	void Update () {

        int minute = Mathf.RoundToInt(Time.time/60f);
        if( minute != lastMinute ) {
            Debug.Log("minute " + minute);
            lastMinute = minute;
        }
	
	}

    public void ResetLevel() {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }

    public void Pause() {
        Time.timeScale = 0f;
        if( pauseMenu ) {
            pauseMenu.Activate(this);
            pauseMenu.enabled = true;
        }
    }

    public void Unpause() {
        Time.timeScale = 1f;
        if( pauseMenu ) {
            pauseMenu.enabled = false;
        }
    }

    public void TogglePause() {
        if( Time.timeScale == 0f ) {
            Unpause();
        }
        else {
            Pause();
        }
    }

    public void OnGameOver() {
        ResetLevel();
    }
}
