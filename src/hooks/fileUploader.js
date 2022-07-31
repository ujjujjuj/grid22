import React, {useRef} from 'react'
import styles from "../styles/addproduct.module.css";

const FileUploader = ({onFileSelectSuccess, onFileSelectError}) => {
    const fileInput = useRef(null)

    const handleFileInput = (e) => {
        const file = e.target.files[0];
        onFileSelectSuccess(file);
      };
    return (
            <input type="file" id='image' name='image' onChange={handleFileInput}   className={styles.imageInput}/>
    )
}

export default FileUploader;