using UnityEngine;
using System.Collections.Generic;

public class EntityPalette : MonoBehaviour
{
    [System.Serializable]
    public class Entry {
        public string lastAssetPath;
        public GameObject prefab;
        public Color32 color;
    }
    public List<Entry> entries;

    public string prefabsAssetPath = "Assets/prefabs";
}
