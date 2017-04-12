using UnityEngine;
using System.Collections;

public class LevelGenSettings : MonoBehaviour
{
    public int iMax = 100;
    public int jMax = 100;

    public GameObject blockPrefab;
    public GameObject softBlockPrefab;
    public GameObject lavaPrefab;
    public GameObject coinPrefab;
    public GameObject[] ents;

    private System.Random rng = new System.Random();

    public bool genOnStart = true;

    void Start() {
        if(genOnStart) {
            this.Generate(this.gameObject);
        }
    }

    void SpawnAt(GameObject prefab, GameObject root, int i, int j)
    {
        GameObject inst = (GameObject)GameObject.Instantiate(prefab,
                Vector3.zero,
                Quaternion.identity);
        inst.name = prefab.name + " " + i + "," + j;
        inst.transform.parent = root.transform;
        inst.transform.localPosition = new Vector3((i-iMax/2)*1f, (j-jMax/2)*1f, 0);
        inst.SetActive(true);
    }

    public void Generate(GameObject root) {
        float perlinScale = 10f;
        //float perlinXOfs = (float)rng.NextDouble()*10f;
        //float perlinYOfs = (float)rng.NextDouble()*10f;
        float perlinXOfs = 0f;
        float perlinYOfs = 0f;

        for( int i = 0; i < iMax; i++ ) {
            for( int j = 0; j < jMax; j++ ) {
                float wallVal = Mathf.PerlinNoise(perlinXOfs + perlinScale * i * 1f/iMax, perlinYOfs + perlinScale * j * 1f/jMax);
                bool onEdge = (i == 0 || j == 0 || i == iMax-1 || j == jMax-1);
                if( onEdge || wallVal > 0.5f ) {
                    float y = Mathf.PerlinNoise(perlinXOfs + perlinScale * i * 1f/iMax + 123.456f, perlinYOfs + perlinScale * j * 1f/jMax + 654.321f);
                    GameObject prefab =
                        y < 0.3f ? lavaPrefab :
                        y < 0.5f ? softBlockPrefab :
                        blockPrefab;
                    SpawnAt( prefab, root, i, j );
                }
                else {
                    if( rng.NextDouble() < 0.01f ) {
                        float entVal = (float)rng.NextDouble();
                        GameObject prefab = ents[(int)Mathf.Floor(entVal * ents.Length)];
                        SpawnAt( prefab, root, i, j );
                    }
                }
            }
        }
    }

}
