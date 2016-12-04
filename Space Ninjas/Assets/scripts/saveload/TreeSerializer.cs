
using UnityEngine;
using System.Collections.Generic;
using System.IO;

public class TreeSerializer
{
    public static void Write(BinaryWriter writer, SerializedNode root) {
        root.Write(writer);
    }
}
