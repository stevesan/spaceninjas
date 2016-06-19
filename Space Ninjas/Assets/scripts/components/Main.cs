using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class Main : MonoBehaviour {

    public abstract class PauseMenu : MonoBehaviour {
        public abstract void Activate(Main main);
    }

    private LevelGen gen;

    public GameObject levelRoot;
    public PauseMenu pauseMenu;

	// Use this for initialization
	void Start () {
        gen = new LevelGen( GetComponent<LevelGenSettings>() );
        gen.Generate(levelRoot);

        // for IOS, must set this for 60 FPS
        Application.targetFrameRate = 60;

        Unpause();
	}
	
	// Update is called once per frame
	void Update () {
	
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
}
