using UnityEngine;
using System.Collections;
using UnityEngine.SceneManagement;

public class Main : MonoBehaviour {

    private LevelGen gen;

    public GameObject levelRoot;

	// Use this for initialization
	void Start () {
        gen = new LevelGen( GetComponent<LevelGenSettings>() );
        gen.Generate(levelRoot);
	}
	
	// Update is called once per frame
	void Update () {
	
	}

    public void ResetLevel() {
        SceneManager.LoadScene(SceneManager.GetActiveScene().buildIndex);
    }
}
