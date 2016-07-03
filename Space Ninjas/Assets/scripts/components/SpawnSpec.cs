
using UnityEngine;

// When you need to spawn something and want to specify how
[System.Serializable]
public class SpawnSpec
{
    public GameObject prefab;

    // Should the prefab spawn spawn with the spawner's rotation?
    public bool inheritRotation = true;

    // Should the spawned instance have the spawner as its parent?
    public bool assignParent = false;

    public GameObject Spawn(Transform spawner) {
        if( !IsValid() ) {
            return null;
        }

        GameObject inst = (GameObject)GameObject.Instantiate(
                prefab,
                spawner.position,
                inheritRotation ? spawner.rotation : Quaternion.identity );

        if(assignParent) {
            inst.transform.parent = spawner;
        }

        inst.SetActive(true);

        return inst;
    }

    public bool IsValid() {
        return prefab != null;
    }

    public void OnStart() {
        if( prefab != null ) {
            prefab.SetActive(false);
        }
    }
}
