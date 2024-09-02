import React, { useState, useEffect } from "react";
import { Button, Table, Modal, Form } from "react-bootstrap";
import { IoMdAddCircleOutline, IoMdCheckmarkCircleOutline, IoMdCloseCircleOutline } from "react-icons/io";
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import './AddToDictionary.css';

const SinhalaDictionary = () => {
  const [words, setWords] = useState([]);
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [showEditWordModal, setShowEditWordModal] = useState(false);
  const [newWord, setNewWord] = useState({ sinhalaWord: "", englishWords: ["", "", ""] });
  const [editWord, setEditWord] = useState({ id: "", sinhalaWord: "", englishWords: ["", "", ""] });
  const [validated, setValidated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWords = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sinhala-dictionary/getWords');
        setWords(response.data);
      } catch (error) {
        console.error("Error fetching words:", error);
      }
    };

    fetchWords();
  }, []);

  const handleAccept = async (id, index) => {
    try {
      await axios.patch(`http://localhost:5000/api/sinhala-dictionary/acceptWord/${id}/${index}`);
      setWords(prevWords =>
        prevWords.map(word =>
          word._id === id
            ? {
                ...word,
                status: word.status.map((status, i) => (i === index ? "accepted" : status))
              }
            : word
        )
      );
    } catch (error) {
      console.error("Error accepting word:", error);
    }
  };

  const handleReject = async (id, index) => {
    try {
      await axios.patch(`http://localhost:5000/api/sinhala-dictionary/rejectWord/${id}/${index}`);
      
      setWords(prevWords => {
        const updatedWords = prevWords.map(word => {
          if (word._id === id) {
            const updatedEnglishWords = word.englishWords.filter((_, i) => i !== index);
            const updatedStatus = word.status.filter((_, i) => i !== index);
  
            // Check if all English words are rejected and delete the Sinhala word
            if (updatedEnglishWords.length === 0) {
              handleDelete(id);
            }
  
            return {
              ...word,
              englishWords: updatedEnglishWords,
              status: updatedStatus,
            };
          }
          return word;
        });
        return updatedWords;
      });
  
    } catch (error) {
      console.error("Error rejecting word:", error);
    }
  };  

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/sinhala-dictionary/deleteWord/${id}`);
      setWords(prevWords => prevWords.filter(word => word._id !== id));
    } catch (error) {
      console.error("Error deleting word:", error);
    }
  };

  const handleShowAddWordModal = () => setShowAddWordModal(true);

  const handleShowEditWordModal = (word) => {
    setEditWord(word);
    setShowEditWordModal(true);
  };

  const handleCloseEditWordModal = () => setShowEditWordModal(false);

  const handleEditWord = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const errorsObj = validateForm(editWord);
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setErrors(errorsObj);
      setValidated(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:5000/api/sinhala-dictionary/updateWord/${editWord.id}`, editWord);
      setWords(prevWords =>
        prevWords.map(word => word._id === editWord.id ? response.data.word : word)
      );
      setEditWord({ id: "", sinhalaWord: "", englishWords: ["", "", ""] });
      setValidated(false);
      handleCloseEditWordModal();
    } catch (error) {
      console.error("Error updating word:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnglishWordChange = (wordType, index, value) => {
    if (wordType === 'newWord') {
      setNewWord(prevState => {
        const updatedWords = [...prevState.englishWords];
        updatedWords[index] = value;
        return { ...prevState, englishWords: updatedWords };
      });
    } else if (wordType === 'editWord') {
      setEditWord(prevState => {
        const updatedWords = [...prevState.englishWords];
        updatedWords[index] = value;
        return { ...prevState, englishWords: updatedWords };
      });
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.sinhalaWord.trim()) errors.sinhalaWord = "Sinhala word is required";
    if (!data.englishWords[0].trim()) errors.englishWords = "At least one English word is required";
    return errors;
  };

  return (
    <div className="container mt-5" style={{ paddingLeft: "0px" }}>
      <h1 className="mb-5 text-center">Sinhala Dictionary Words</h1>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <Link to="/AddToDictionary">
          <Button variant="primary" onClick={handleShowAddWordModal}>
            <IoMdAddCircleOutline className="mb-1" /> Add Word
          </Button>
        </Link>
      </div><br/>

      <Table bordered hover className="table-bordered" style={{ backgroundColor: "#f9f9f9", borderRadius: "10px", overflow: "hidden", border: "2px solid black", width: "100%", tableLayout: "fixed" }}>
        <thead>
          <tr align="center" style={{ backgroundColor: "#007bff", color: "white", fontSize: "14px" }}>
            <th style={{ padding: "5px", width: "15%" }}>Sinhala Word</th>
            <th style={{ padding: "10px", width: "10%" }}>Edit/Delete</th>
            <th style={{ padding: "5px", width: "15%" }}>English Word 1</th>
            <th style={{ padding: "5px", width: "10%" }}>Status 1</th>
            <th style={{ padding: "0px", width: "10%" }}>Action 1</th>
            <th style={{ padding: "5px", width: "15%" }}>English Word 2</th>
            <th style={{ padding: "5px", width: "10%" }}>Status 2</th>
            <th style={{ padding: "0px", width: "10%" }}>Action 2</th>
            <th style={{ padding: "5px", width: "15%" }}>English Word 3</th>
            <th style={{ padding: "5px", width: "10%" }}>Status 3</th>
            <th style={{ padding: "0px", width: "10%" }}>Action 3</th>
          </tr>
        </thead>
        <tbody align="center" style={{ backgroundColor: "#e9ecef" }}>
          {words.map(word => (
            <tr key={word._id}>
              <td style={{ padding: "5px", verticalAlign: "middle" }}>{word.sinhalaWord}</td>
              <td style={{ padding: '0px', verticalAlign: 'middle' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    variant="warning"
                    onClick={() => handleShowEditWordModal(word)}
                    style={{ marginRight: '5px', backgroundColor: '#f0ad4e', borderColor: '#eea236' }}
                  >
                    <FaEdit style={{ marginRight: '1px' }} />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(word._id)}
                    style={{ backgroundColor: '#d9534f', borderColor: '#d43f3a' }}
                  >
                    <FaTrash style={{ marginRight: '0px' }} />
                  </Button>
                </div>
              </td>
              {(word.englishWords || []).map((englishWord, index) => (
                <React.Fragment key={index}>
                  <td style={{ padding: "5px", verticalAlign: "middle" }}>{englishWord || ''}</td>
                  <td style={{ padding: "5px", verticalAlign: "middle" }}>{word.status[index] || ''}</td>
                  <td style={{ padding: "0px", verticalAlign: "middle" }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {word.status[index] !== "accepted" && word.status[index] !== "" && (
                        <>
                          <Button variant="success" onClick={() => handleAccept(word._id, index)} style={{ marginRight: '5px', backgroundColor: '#28a745', color: '#fff', border: 'none' }}>
                            <IoMdCheckmarkCircleOutline />
                          </Button>
                          <Button variant="danger" onClick={() => handleReject(word._id, index)} style={{ backgroundColor: '#dc3545', color: '#fff', border: 'none' }}>
                            <IoMdCloseCircleOutline />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </React.Fragment>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Edit Word Modal */}
      <Modal show={showEditWordModal} onHide={handleCloseEditWordModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Word</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleEditWord}>
            <Form.Group className="mb-3" controlId="sinhalaWord">
              <Form.Label>Sinhala Word</Form.Label>
              <Form.Control
                type="text"
                value={editWord.sinhalaWord}
                onChange={(e) => setEditWord(prevState => ({ ...prevState, sinhalaWord: e.target.value }))}
                required
                isInvalid={!!errors.sinhalaWord}
              />
              <Form.Control.Feedback type="invalid">
                {errors.sinhalaWord}
              </Form.Control.Feedback>
            </Form.Group>

            {editWord.englishWords.map((englishWord, index) => (
              <Form.Group className="mb-3" controlId={`englishWord${index}`} key={index}>
                <Form.Label>English Word {index + 1}</Form.Label>
                <Form.Control
                  type="text"
                  value={englishWord}
                  onChange={(e) => handleEnglishWordChange('editWord', index, e.target.value)}
                  required={index === 0}
                  isInvalid={index === 0 && !!errors.englishWords}
                />
                {index === 0 && (
                  <Form.Control.Feedback type="invalid">
                    {errors.englishWords}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            ))}

            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={handleCloseEditWordModal}>
                Close
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default SinhalaDictionary;