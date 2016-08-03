
using UnityEngine;
using System.Collections.Generic;

// When you need to spawn something and want to specify how
[System.Serializable]
public class MultiSpawnSpec
{
    public SpawnSpec[] specs;

    public IEnumerable<GameObject> Spawn(Transform spawner) {
        foreach( var spec in specs ) {
            yield return spec.Spawn(spawner);
        }
        yield break;
    }

    public void OnStart() {
        foreach( var spec in specs ) {
            spec.OnStart();
        }
    }
}
