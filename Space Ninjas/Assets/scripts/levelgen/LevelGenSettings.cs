using UnityEngine;
using System.Collections;

public class LevelGenSettings : MonoBehaviour
{
    public GameObject blockPrefab;
    public GameObject softBlockPrefab;
    public GameObject lavaPrefab;
    public GameObject coinPrefab;
    public GameObject[] ents;

    public bool genOnStart = true;

    void Start() {
        if(genOnStart) {
            LevelGen gen = new LevelGen( GetComponent<LevelGenSettings>() );
            gen.Generate(gameObject);
        }
    }
}
