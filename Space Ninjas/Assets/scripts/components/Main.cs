using UnityEngine;
using System.Collections.Generic;
using UnityEngine.SceneManagement;
using System.IO;
using Diag = System.Diagnostics;

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
        bulletTime.Start();
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
        bulletTime.Update();
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

    [System.Serializable]
    private class BulletTime
    {
        [System.Serializable]
        struct Request {
            public float scale;
            public long endTimeMillis;

            public Request(float scale, long endTimeMillis) {
                this.scale = scale;
                this.endTimeMillis = endTimeMillis;
            }
        }

        // support fixed number of requests for now
        [SerializeField]
        private Request[] requests = new Request[10];

        // TODO switch to using Time.unscaledDeltaTime instead.
        private Diag.Stopwatch realTime = new Diag.Stopwatch();

        public void Start() {
            Time.timeScale = 1.0f;
            realTime.Start();
        }

        public void Update() {
            // enforce the slowest, still valid request
            float slowest = 1f;
            for( int i = 0; i < requests.Length; i++ ) {
                if(IsRequestValid(requests[i])) {
                    slowest = Mathf.Min(slowest, requests[i].scale);
                }
            }

            Time.timeScale = slowest;
        }

        public void Trigger(float scale, float duration) {
            // find a free slot, enter
            for( int i = 0; i < requests.Length; i++ ) {
                if(!IsRequestValid(requests[i])) {
                    long endMillis = GetRealTimeMillis() + duration.SecsToMillis();
                    requests[i] = new Request(scale, endMillis);
                    break;
                }
            }

            // immedatiately update, in case
            Update();
        }

        private long GetRealTimeMillis() {
            return realTime.ElapsedMilliseconds;
        }

        private bool IsRequestValid( Request req ) {
            return GetRealTimeMillis() < req.endTimeMillis;
        }
    }

    private BulletTime bulletTime = new BulletTime();

    public void TriggerBulletTime(float scale, float duration) {
        bulletTime.Trigger(scale, duration);
    }
}
