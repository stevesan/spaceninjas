
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

        Transform parent = assignParent ? spawner.parent
            : spawner.GetComponentInParent<GameScope>().transform;

        GameObject inst = (GameObject)Object.Instantiate(
                prefab,
                spawner.position,
                inheritRotation ? spawner.rotation : Quaternion.identity);

        inst.transform.parent = parent;
        inst.SetActive(true);

        return inst;
    }

    public bool IsValid() {
        return prefab != null;
    }

    public void OnStart() {
    }
}
