using UnityEngine;
using System.Collections.Generic;
using System.IO;
using System.Linq;

//----------------------------------------
//  Tags this gameobject as managed by serialization.
//  Analogous to version controlling a file in a source tree.
//----------------------------------------
public class SerializedNode : MonoBehaviour
{
    public string prefabResourcePath;

    private static IEnumerable<SerializedNode> managedChildren(GameObject root) {
        foreach(Transform child in root.transform) {
            SerializedNode node = child.gameObject.GetComponent<SerializedNode>();
            if(node != null) {
                yield return node;
            }
        }
    }

    public static IEnumerable<Transform> AncestryUpTo( Transform descendent, Transform ancestor ) {
        Transform curr = descendent.parent;
        while(curr != null && curr != ancestor) {
            yield return curr;
            curr = curr.parent;
        }

        if(curr == null) {
            throw new System.ArgumentException("Given descendent '"+descendent.gameObject.name + "' was not actually under ancestor '"+ancestor.gameObject.name+"'");
        }
    }

    public static void Save( GameObject root, BinaryWriter s ) {
        // TODO write in depth order, to support hierarchies of nodes
        int count = 0;
        foreach( SerializedNode node in root.GetComponentsInChildren<SerializedNode>() ) {
            count++;
        }
        s.Write(count);

        foreach( SerializedNode node in root.GetComponentsInChildren<SerializedNode>() ) {

            Debug.Log("writing " + node.gameObject.name);

            if(node.prefabResourcePath == null || node.prefabResourcePath.Length == 0) {
                throw new System.ArgumentException("Managed object " + node.gameObject.name + " does not have a prefab resource path assigned.");
            }

            s.Write(node.prefabResourcePath);

            // write ancestry backwards, so it's easy to follow it down when loading
            List<Transform> path = AncestryUpTo( node.transform, root.transform ).ToList();
            path.Reverse();
            s.Write(path.Count);
            foreach( Transform t in path ) {
                Debug.Log(t.gameObject.name);
                s.Write(t.gameObject.name);
            }

            node.WriteSelf(s);
        }
    }

    public static Transform FindChildByName( Transform root, string name ) {
        foreach( Transform c in root ) {
            if( c.gameObject.name == name ) {
                return c;
            }
        }
        return null;
    }

    public static void Load( GameObject root, BinaryReader r ) {
        // clear out 
        DestroyManagedObjects(root);

        int count = r.ReadInt32();
        Debug.Log("Loading " + count + " objects");

        for( int i = 0; i < count; i++ ) {
            string resPath = r.ReadString();

            // read in path and follow it to the parent
            Transform parent = root.transform;
            int pathLen = r.ReadInt32();
            for( int j = 0; j < pathLen; j++ ) {
                string name = r.ReadString();
                parent = FindChildByName( parent, name );
            }

            GameObject prefab = Resources.Load<GameObject>(resPath);
            if(prefab == null) {
                throw new System.ArgumentException("Could not load prefab for loading a managed instance. Prefab res path = " + resPath);
            }
            else {
                GameObject inst = (GameObject)Object.Instantiate(prefab);
                inst.transform.parent = parent;
                SerializedNode node = inst.GetComponent<SerializedNode>();
                node.ReadSelf(r);
            }
        }
    }

        /*
    public static void Save(GameObject root, BinaryWriter s) {
        // Is this node itself saved?
        SerializedNode node = root.GetComponent<SerializedNode>();
        if(node == null) {
            s.Write(false);
            // so we know which non-managed object is the parent
            // Yeah, this is unreliable, but it's the best we can do given that Unity does not expose a stable object ID.
            s.Write(root.name);
        }
        else {
            s.Write(true);
            // so we create it from prefab
            s.Write(node.prefabResourcePath);
            node.WriteSelf(s);
        }

        int count = 0;
        foreach( SerializedNode child in managedChildren(root) ) {
            count++;
        }
        s.Write(count);

        foreach( SerializedNode child in managedChildren(root) ) {
            Save(child.gameObject, s);
        }
    }

    public static GameObject Load(GameObject root, BinaryReader r) {
        // clean the root we're loading into - we'll recreate any managed objects that still exist
        for( SerializedNode child in managedChildren(root) ) {
            Object.Destroy(child.gameObject);
        }

        bool rootManaged = r.Read

        string resPath = r.ReadString();
        Debug.Log("loading prefab " + resPath);
        GameObject prefab = Resources.Load<GameObject>(resPath);
        if(prefab == null) {
            Debug.LogError("Could not load prefab for loading a managed instance. Prefab res path = " + resPath);
            return null;
        }
        else {
            GameObject inst = (GameObject)Object.Instantiate(prefab);
            inst.transform.parent = root.transform;
            SerializedNode node = inst.GetComponent<SerializedNode>();
            node.ReadSelf(r);
            return inst;
            // TODO load children
        }
    }
    */

    protected virtual void WriteSelf(BinaryWriter s) {
        s.WriteTransform(transform);
    }

    protected virtual void ReadSelf(BinaryReader r) {
        r.ReadTransform(transform);
    }

    public static void DestroyManagedObjects(GameObject root) {
        foreach( var node in root.GetComponentsInChildren<SerializedNode>() ) {
            if( node != null ) {
                Object.Destroy(node.gameObject);
            }
        }
    }
}
