import {useEffect, useRef, useState} from 'react';
import useFileHandler from '../../hooks/useFileHandler';
import './DragAndDrop.css';
import PreviewModal from './PreviewModal';
const validImageFormats = ['jpg', 'png', 'svg'];

const DragAndDrop = () => {
	const [isDragging, setIsDragging] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isUploadSuccessfull, setIsUploadSuccessfull] = useState(false);
	const fileInputRef = useRef(null);
	const {
		file: image,
		setFile: setImage,
		error: errorMessage,
		handleFile,
	} = useFileHandler(validImageFormats);

	// Revoke the object URL whenever the image changes or the component unmounts to avoid memory leak.
	useEffect(() => {
		if (image) setIsModalOpen(true);

		return () => {
			if (image?.url) {
				URL.revokeObjectURL(image.url);
			}
		};
	}, [image]);

	function handleFileSelection() {
		fileInputRef.current.click();
	}

	function onFileSelect(event) {
		setIsUploadSuccessfull(false);
		const files = event.target.files;
		if (files.length === 0) return;
		const file = files[0];
		handleFile(file);
	}

	function handleImageNameChange(event) {
		setImage((prev) => {
			return {name: event.target.value, url: prev.url};
		});
	}

	function handleDragLeave(event) {
		event.preventDefault();
		setIsDragging(false);
	}

	function handleDragOver(event) {
		event.preventDefault();
		setIsDragging(true);
		event.dataTransfer.dropEffect = 'copy';
	}

	function handleOnDrop(event) {
		event.preventDefault();
		setIsUploadSuccessfull(false);
		setIsDragging(false);
		const files = event.dataTransfer.files;
		if (files.length === 0) return;
		const file = files[0];
		handleFile(file);
	}

	return (
		<section className='drag-drop-section'>
			<div
				className='drag-area'
				role='button'
				onClick={handleFileSelection}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleOnDrop}
			>
				{isDragging ? (
					<p>Yes, drop here</p>
				) : (
					<p className='select'>
						Drag and drop your image here or click to browse.
					</p>
				)}
				<input
					ref={fileInputRef}
					onChange={onFileSelect}
					name='file'
					type='file'
					className='file'
					accept='image/jpeg, image/png, image/svg+xml'
				/>
			</div>
			{errorMessage && <p className='image-select-error'>{errorMessage}</p>}
			{image && (
				<PreviewModal
					image={image}
					handleImageNameChange={handleImageNameChange}
					isModalOpen={isModalOpen}
					setIsModalOpen={setIsModalOpen}
					isUploadSuccessfull={isUploadSuccessfull}
					setIsUploadSuccessfull={setIsUploadSuccessfull}
				/>
			)}
		</section>
	);
};

export default DragAndDrop;
