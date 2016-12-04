using UnityEngine;
using System.Collections.Generic;
using System.IO;

//----------------------------------------
//  Subclass this for great success
//----------------------------------------
public class SerializedNode : MonoBehaviour
{
    protected virtual void WriteSelf(BinaryWriter s) {
        Debug.Log("wrote a transform");
        s.WriteTransform(transform);
    }

    public void Write(BinaryWriter s) {
        Debug.Log("wrote a transform");
        WriteSelf(s);

        // for each child...
    }

    public void Read(BinaryReader r) {
        r.ReadTransform(transform);
    }
}
