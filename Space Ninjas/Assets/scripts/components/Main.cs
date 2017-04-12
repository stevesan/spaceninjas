using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;
using System.IO;

public class Main : MonoBehaviour {

    public abstract class PauseMenu : MonoBehaviour {
        public abstract void Activate(Main main);
    }

    public PauseMenu pauseMenu;

    int lastMinute = -1;

	// Use this for initialization
	void Start () {
        // for IOS, must set this for 60 FPS
        Application.targetFrameRate = 60;

        Unpause();
	}

    string GetSavePath() {
        return Application.persistentDataPath + "/test.dat";
    }

    void PollDebugKeys() {
        if( Input.GetKeyDown("s") ) {
            var root = GetComponentInParent<GameScope>().gameObject;
            Debug.Log("saving " + GetSavePath());

            using(FileStream file = File.OpenWrite(GetSavePath())) {
                using(var writer = new BinaryWriter(file)) {
                    SerializedNode.Save(root, writer);
                }
            }
        }

        if( Input.GetKeyDown("l") ) {
            var root = GetComponentInParent<GameScope>().gameObject;
            Debug.Log("loading " + GetSavePath());
            using(FileStream file = File.OpenRead(GetSavePath())) {
                using( var reader = new BinaryReader(file) ) {
                    SerializedNode.Load(root, reader);
                }
            }
        }

        if(Input.GetKeyDown("r")) {
            ResetLevel();
        }
    }
	
	// Update is called once per frame
	void Update () {

        int minute = Mathf.RoundToInt(Time.time/60f);
        if( minute != lastMinute ) {
            Debug.Log("minute " + minute);
            lastMinute = minute;
        }
	
        PollDebugKeys();
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
