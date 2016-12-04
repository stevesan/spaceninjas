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
            Player p = GetComponentInParent<GameScope>().Get<Player>();
            var node = p.GetComponent<SerializedNode>();
            Debug.Log("saving " + GetSavePath());
            FileStream file = File.OpenWrite(GetSavePath());
            var writer = new BinaryWriter(file);
            node.Write(writer);
            file.Close();

        }

        if( Input.GetKeyDown("l") ) {
            Player p = GetComponentInParent<GameScope>().Get<Player>();
            var node = p.GetComponent<SerializedNode>();
            Debug.Log("loading " + GetSavePath());
            FileStream file = File.OpenRead(GetSavePath());
            var reader = new BinaryReader(file);
            node.Read(reader);
            file.Close();
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
