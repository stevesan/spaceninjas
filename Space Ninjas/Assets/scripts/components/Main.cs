using UnityEngine;
using System.Collections;

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
}
