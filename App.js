//https://reffect.co.jp/react/react-native-firsttime
//https://reffect.co.jp/react/react-native-camera
//撮った画像のuri（picture）を画像にして、gl-reactで編集できるようにする
//https://tech.fusic.co.jp/posts/2022-01-31-react-webcam-base64/

// if (!global.btoa) {
//   global.btoa = encode;
// }
// if (!global.atob) {
//   global.atob = decode;
// }
// import { decode, encode } from "base-64";

import React, { useState, useEffect, Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { Camera } from "expo-camera";
import * as MediaLibrary from "expo-media-library";
import { Ionicons } from "@expo/vector-icons";
//gl-react
import { Shaders, Node, GLSL } from "gl-react";
import { Surface } from "gl-react-expo";
import ktgrnk from "./ktgrnk.jpeg";

//gl-react
const shaders = Shaders.create({
  Saturate: {
    frag: GLSL`
precision highp float;
varying vec2 uv;
uniform sampler2D t;
uniform float contrast, saturation, brightness;
const vec3 L = vec3(0.2125, 0.7154, 0.0721);
void main() {
  vec4 c = texture2D(t, uv);
	vec3 brt = c.rgb * brightness;
	gl_FragColor = vec4(mix(
    vec3(0.5),
    mix(vec3(dot(brt, L)), brt, saturation),
    contrast), c.a);
}
`,
  },
});

// export const Saturate = ({ contrast, saturation, brightness, children }) => (
//   <Node
//     shader={shaders.Saturate}
//     uniforms={{ contrast, saturation, brightness, t: children }}
//   />
// );

// export default class App extends Component {
//   render() {
//     return (
//       <Surface style={{ width: "100%", height: "60%" }}>
//         <Saturate {...this.props}>
//           {ktgrnk}
//           {/* {{uri:picture}} */}
//         </Saturate>
//       </Surface>
//     );
//   }
//   static defaultProps = {
//     contrast: 1.3,
//     saturation: 0.85,
//     brightness: 1,
//   };
// }

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [type, setType] = useState(Camera.Constants.Type.back);
  const [camera, setCamera] = useState(null);
  const [picture, setPicture] = useState(null);
  const [photo, setPhoto] = useState(null);

  const takePicture = async () => {
    if (camera) {
      const image = await camera.takePictureAsync();
      setPicture(image.uri);

      //画像をiphoneに保存させる
      // const { status } = await MediaLibrary.requestPermissionsAsync();
      // if (status === "granted") {
      //   const asset = await MediaLibrary.createAssetAsync(image.uri);
      //   // setPhoto(asset);
      //   // console.log(asset);
      // }
    }
  };

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  if (hasPermission === null) {
    return <View />;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* gl-react */}
      {/* <View style={{ marginTop: 24, flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Surface style={{ width: "100%", height: "100%" }}>
            <Node
              shader={shaders.Saturate}
              uniforms={{
                contrast: 1.3,
                saturation: 0.65,
                brightness: 0.9,
                t: { uri: picture },
              }}
            />
          </Surface>
        </View>
      </View> */}

      {/* camera */}
      <View style={{ flex: 1 }}>
        {!picture ? (
          <Camera
            type={type}
            style={{ flex: 1 }}
            ref={(ref) => {
              setCamera(ref);
            }}
          />
        ) : (
          // 撮った画像
          // <Image
          //   source={{ uri: picture }}
          //   style={{ flex: 1, transform: [{ rotateZ: "90deg" }] }}
          // />
          <View
            style={{
              flex: 1,
              transform: [
                { rotate: "90deg" },
                { scale: (-1, 1) },
                { scale: 1.75 },
              ],
            }}
          >
            <Surface
              style={{
                flex: 1,
                width: "100%",
                height: "100%",
                transform: [
                  { scaleY: 1 / 1.77777778 }, //16:9
                ],
              }}
            >
              <Node
                shader={shaders.Saturate}
                uniforms={{
                  contrast: 1.4,
                  saturation: 0.65,
                  brightness: 0.95,
                  t: { uri: picture },
                  // t: ktgrnk,
                }}
              />
            </Surface>
          </View>
        )}
      </View>

      <View
        style={{
          height: 60,
          justifyContent: "space-evenly",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        {picture ? (
          <TouchableOpacity onPress={() => setPicture(null)}>
            <Ionicons name="ios-camera-outline" size={40} color="black" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => takePicture()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 50,
              borderWidth: 5,
              borderColor: "black",
            }}
          />
        )}

        <TouchableOpacity
          onPress={() => {
            setType(
              type === Camera.Constants.Type.back
                ? Camera.Constants.Type.front
                : Camera.Constants.Type.back
            );
          }}
        >
          <Ionicons name="ios-camera-reverse-sharp" size={40} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
