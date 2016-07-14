
using UnityEngine;
using System.Collections;

public class LevelGen {

    private LevelGenSettings settings;

    private System.Random rng = new System.Random();

    private int iMax = 100;
    private int jMax = 100;

    public LevelGen( LevelGenSettings settings ) {
        this.settings = settings;
    }

    void SpawnAt(GameObject prefab, GameObject root, int i, int j)
    {
        prefab.SetActive(false);

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
        for( int i = 0; i < iMax; i++ ) {
            for( int j = 0; j < jMax; j++ ) {
                float wallVal = Mathf.PerlinNoise(perlinScale * i * 1f/iMax, perlinScale * j * 1f/jMax);
                bool onEdge = (i == 0 || j == 0 || i == iMax-1 || j == jMax-1);
                if( onEdge || wallVal > 0.5f ) {
                    float y = Mathf.PerlinNoise(perlinScale * i * 1f/iMax + 123.456f, perlinScale * j * 1f/jMax + 654.321f);
                    GameObject prefab =
                        y < 0.3f ? settings.lavaPrefab :
                        y < 0.5f ? settings.softBlockPrefab :
                        settings.blockPrefab;
                    SpawnAt( prefab, root, i, j );
                }
                else {
                    if( rng.NextDouble() < 0.01f ) {
                        float entVal = (float)rng.NextDouble();
                        GameObject prefab = settings.ents[(int)Mathf.Floor(entVal * settings.ents.Length)];
                        SpawnAt( prefab, root, i, j );
                    }
                }
            }
        }
    }

}
