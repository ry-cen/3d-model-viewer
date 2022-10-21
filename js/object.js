'use strict'

import SceneNode from "./scenenode.js";
import Material from "./material.js"
import { loadTexture } from "./utils.js";

class ObjectNode extends SceneNode
{

    constructor( vbo_data, name, parent, translation = vec3.create( ), rotation = vec3.create( ), scale = vec3.fromValues( 1, 1, 1 ), material = new Material(), textures = [null, null])
    {

        super( name, parent, translation, rotation, scale )

        this.type = "object"
        this.vbo_data = new Float32Array( vbo_data )
        this.vbo = null
        this.material = material
        this.texture_image = textures[0];
        this.normal_texture_image = textures[1];

    }


    update( )
    {
        
        super.update( )

    }


    getWorldSpaceTriangles() {
        let triangles = []

        for(let i = 0; i < this.vbo_data.length; i += 60) {
            let offset = 0
            let triangle = []
            for (let j = 0; j < 3; j++) {
                offset = j*20
                let v = vec3.fromValues(this.vbo_data[offset + i], this.vbo_data[offset + i+1], this.vbo_data[offset + i+2])
                v = vec3.transformMat4(v, v, this.getTransform())
                triangle.push(v)
            }

            triangles.push(triangle)
        }

        return triangles
    }

    createBuffers( gl )
    {
        this.vbo = gl.createBuffer( );
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vbo )
        gl.bufferData( gl.ARRAY_BUFFER, this.vbo_data, gl.STATIC_DRAW )

        // Loads the texture and normal map and binds it to the texture.
        if(this.texture_image != null) {
            this.texture = loadTexture(gl, this.texture_image);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
        }

        if(this.normal_texture_image != null) {
            this.normal_texture = loadTexture(gl, this.normal_texture_image);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.normal_texture);
        }

    }

    render( gl, shader, flat=false, nearest=false)
    {

        if ( this.vbo == null ) {
            
            this.createBuffers( gl )
            
        }


        // Geometric Properties
        let stride = (6 * 3 * 4) + 8,
            offset = 0
        gl.bindBuffer( gl.ARRAY_BUFFER, this.vbo )
        shader.setArrayBuffer( "a_position", this.vbo, 3, stride, offset);

        offset = 3 * 4
        shader.setArrayBuffer( "a_color", this.vbo, 3, stride, offset);

        if (flat)
            offset = 2 * 3 * 4
        else
            offset = 3 * 3 * 4
        shader.setArrayBuffer( "a_normal", this.vbo, 3, stride, offset);

        offset = 4 * 3 * 4;

        shader.setArrayBuffer("a_tangent", this.vbo, 3, stride, offset);

        offset = 5 * 3 * 4;

        shader.setArrayBuffer("a_bitangent", this.vbo, 3, stride, offset);

        offset = 6 * 3 * 4;

        shader.setArrayBuffer("a_texture_coord", this.vbo, 2, stride, offset);

        // Binds the active texture and normal map from the texture stored in the object.
        if(this.texture != null) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.texture);
            shader.setUniform1i("u_texture_map", 0);
            shader.setUniform1i("u_has_texture", 1);
        } else {
            shader.setUniform1i("u_has_texture", 0);
        }
        
        if(this.normal_texture != null) {
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.normal_texture);
            shader.setUniform1i("u_normal_map", 1);
            shader.setUniform1i("u_has_normal", 1);
        } else {
            shader.setUniform1i("u_has_normal", 0);
        }

        // Toggle for filtering type.
        if(nearest) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        }
        
        // Material Properties
        shader.setUniform3f( "ka", this.material.ka )
        shader.setUniform3f( "kd", this.material.kd )
        shader.setUniform3f( "ks", this.material.ks )
        shader.setUniform1f( "alpha", this.material.alpha )
        

        gl.drawArrays( gl.TRIANGLES, 0, this.vbo_data.length / 20 )

    }
}

export default ObjectNode
